/**
 * Backend API Test Suite
 * Comprehensive tests for the Country Explorer API
 */

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  statusCode?: number;
}

class ApiTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:5001') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<{
    response: Response;
    data: any;
    duration: number;
  }> {
    const start = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      const data = await response.json();
      const duration = Date.now() - start;
      
      return { response, data, duration };
    } catch (error) {
      const duration = Date.now() - start;
      throw new Error(`Network error: ${error} (${duration}ms)`);
    }
  }

  private addResult(result: TestResult) {
    this.results.push(result);
    const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${status} ${result.name} (${result.duration}ms): ${result.message}`);
  }

  // Test 1: Health Check
  async testHealthCheck(): Promise<void> {
    try {
      const { response, data, duration } = await this.makeRequest('/health');
      
      if (response.status === 200 && data.success === true) {
        this.addResult({
          name: 'Health Check',
          status: 'PASS',
          message: `API is healthy. Uptime: ${data.uptime?.toFixed(2)}s`,
          duration
        });
      } else {
        this.addResult({
          name: 'Health Check',
          status: 'FAIL',
          message: `Expected 200 OK with success:true, got ${response.status}`,
          duration
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Health Check',
        status: 'FAIL',
        message: `${error}`,
        duration: 0
      });
    }
  }

  // Test 2: Basic Countries Endpoint
  async testBasicCountries(): Promise<void> {
    try {
      const { response, data, duration } = await this.makeRequest('/api/v1/countries');
      
      if (response.status === 200 && data.success === true && Array.isArray(data.data)) {
        this.addResult({
          name: 'Basic Countries Endpoint',
          status: 'PASS',
          message: `Retrieved ${data.data.length} countries with pagination`,
          duration
        });
      } else {
        this.addResult({
          name: 'Basic Countries Endpoint',
          status: 'FAIL',
          message: `Expected successful response with data array, got status ${response.status}`,
          duration
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Basic Countries Endpoint',
        status: 'FAIL',
        message: `${error}`,
        duration: 0
      });
    }
  }

  // Test 3: Pagination
  async testPagination(): Promise<void> {
    try {
      const { response, data, duration } = await this.makeRequest('/api/v1/countries?page=1&limit=5');
      
      if (response.status === 200 && 
          data.success === true && 
          data.pagination?.page === 1 && 
          data.pagination?.limit === 5 &&
          data.data.length <= 5) {
        this.addResult({
          name: 'Pagination',
          status: 'PASS',
          message: `Page 1, limit 5: got ${data.data.length} items. Total: ${data.pagination.total}`,
          duration
        });
      } else {
        this.addResult({
          name: 'Pagination',
          status: 'FAIL',
          message: `Pagination parameters not respected or incorrect response structure`,
          duration
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Pagination',
        status: 'FAIL',
        message: `${error}`,
        duration: 0
      });
    }
  }

  // Test 4: Search Functionality
  async testSearch(): Promise<void> {
    try {
      const { response, data, duration } = await this.makeRequest('/api/v1/countries?search=united');
      
      if (response.status === 200 && data.success === true) {
        const hasSearchTerm = data.data.some((country: any) => 
          country.name.common.toLowerCase().includes('united')
        );
        
        if (hasSearchTerm || data.data.length === 0) {
          this.addResult({
            name: 'Search Functionality',
            status: 'PASS',
            message: `Search for 'united' returned ${data.data.length} results`,
            duration
          });
        } else {
          this.addResult({
            name: 'Search Functionality',
            status: 'FAIL',
            message: `Search results don't contain the search term`,
            duration
          });
        }
      } else {
        this.addResult({
          name: 'Search Functionality',
          status: 'FAIL',
          message: `Search request failed with status ${response.status}`,
          duration
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Search Functionality',
        status: 'FAIL',
        message: `${error}`,
        duration: 0
      });
    }
  }

  // Test 5: Region Filter
  async testRegionFilter(): Promise<void> {
    try {
      const { response, data, duration } = await this.makeRequest('/api/v1/countries?region=Europe');
      
      if (response.status === 200 && data.success === true) {
        const allEurope = data.data.every((country: any) => 
          country.region === 'Europe'
        );
        
        if (allEurope || data.data.length === 0) {
          this.addResult({
            name: 'Region Filter',
            status: 'PASS',
            message: `Europe filter returned ${data.data.length} countries`,
            duration
          });
        } else {
          this.addResult({
            name: 'Region Filter',
            status: 'FAIL',
            message: `Some results are not from Europe region`,
            duration
          });
        }
      } else {
        this.addResult({
          name: 'Region Filter',
          status: 'FAIL',
          message: `Region filter request failed with status ${response.status}`,
          duration
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Region Filter',
        status: 'FAIL',
        message: `${error}`,
        duration: 0
      });
    }
  }

  // Test 6: CORS Headers
  async testCORS(): Promise<void> {
    try {
      const { response, duration } = await this.makeRequest('/api/v1/countries', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5174',
          'Access-Control-Request-Method': 'GET'
        }
      });
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      
      if (response.status === 200 || response.status === 204) {
        this.addResult({
          name: 'CORS Headers',
          status: 'PASS',
          message: `CORS configured correctly. Allow-Origin: ${corsHeader}`,
          duration
        });
      } else {
        this.addResult({
          name: 'CORS Headers',
          status: 'FAIL',
          message: `CORS preflight failed with status ${response.status}`,
          duration
        });
      }
    } catch (error) {
      this.addResult({
        name: 'CORS Headers',
        status: 'FAIL',
        message: `${error}`,
        duration: 0
      });
    }
  }

  // Test 7: Error Handling
  async testErrorHandling(): Promise<void> {
    try {
      const { response, data, duration } = await this.makeRequest('/api/v1/nonexistent');
      
      if (response.status === 404 && data.success === false) {
        this.addResult({
          name: 'Error Handling',
          status: 'PASS',
          message: `404 errors properly formatted: ${data.error}`,
          duration
        });
      } else {
        this.addResult({
          name: 'Error Handling',
          status: 'FAIL',
          message: `Expected 404 with success:false, got ${response.status}`,
          duration
        });
      }
    } catch (error) {
      this.addResult({
        name: 'Error Handling',
        status: 'FAIL',
        message: `${error}`,
        duration: 0
      });
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Backend API Tests...\n');
    
    const tests = [
      () => this.testHealthCheck(),
      () => this.testBasicCountries(),
      () => this.testPagination(),
      () => this.testSearch(),
      () => this.testRegionFilter(),
      () => this.testCORS(),
      () => this.testErrorHandling(),
    ];

    for (const test of tests) {
      await test();
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`⏭️ Skipped: ${skipped}/${total}`);
    console.log(`⏱️ Average Response Time: ${avgDuration.toFixed(2)}ms`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Backend is working perfectly.');
    } else {
      console.log('\n⚠️ Some tests failed. Check the issues above.');
    }
  }
}

// Usage
const tester = new ApiTester();
tester.runAllTests().catch(console.error);

export { ApiTester };