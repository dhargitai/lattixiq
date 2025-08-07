// fail-files-reporter.ts

interface TestResult {
  state: "fail" | "failed" | "pass" | "passed";
  errors?: Error[];
}

interface Task {
  type: "test" | "suite" | "describe";
  name?: string;
  title?: string;
  result?: TestResult;
  tasks?: Task[];
}

interface TestFile {
  name?: string;
  filepath?: string;
  id?: string;
  result?: TestResult;
  tasks?: Task[];
}

interface FailedTest {
  description: string;
}

export default class FailFilesReporter {
  onFinished(files: TestFile[] = []): void {
    const failedFiles = new Map<string, FailedTest[]>();

    for (const file of files) {
      const hasFailed =
        file.result?.state === "fail" ||
        file.result?.state === "failed" ||
        (file.result?.errors && file.result.errors.length > 0);

      if (hasFailed) {
        const filePath = file.name || file.filepath || file.id || "unknown";
        const failedTests = this.extractFailedTests(file);

        if (failedTests.length > 0) {
          failedFiles.set(filePath, failedTests);
        }
      }
    }

    // Output file paths with their failed test cases
    for (const [filePath, failedTests] of failedFiles) {
      console.log(filePath);
      for (const test of failedTests) {
        console.log(`- ${test.description}`);
      }
    }
  }

  extractFailedTests(file: TestFile): FailedTest[] {
    const failedTests: FailedTest[] = [];

    const tasks = file.tasks || [];

    for (const task of tasks) {
      if (task.type === "test") {
        if (task.result?.state === "fail" || task.result?.state === "failed") {
          failedTests.push({
            description: task.name || task.title || "Unnamed test",
          });
        }
      } else if (task.type === "suite" || task.type === "describe") {
        // Recursively check nested tests
        const nestedTests = this.extractFailedTestsFromSuite(task);
        failedTests.push(...nestedTests);
      }
    }

    return failedTests;
  }

  extractFailedTestsFromSuite(suite: Task): FailedTest[] {
    const failedTests: FailedTest[] = [];
    const suiteTasks = suite.tasks || [];

    for (const task of suiteTasks) {
      if (task.type === "test") {
        if (task.result?.state === "fail" || task.result?.state === "failed") {
          const suiteName = suite.name || suite.title || "";
          const testName = task.name || task.title || "Unnamed test";
          const description = suiteName ? `${suiteName} > ${testName}` : testName;

          failedTests.push({
            description,
          });
        }
      } else if (task.type === "suite" || task.type === "describe") {
        // Handle nested suites recursively
        const nestedTests = this.extractFailedTestsFromSuite(task);
        failedTests.push(...nestedTests);
      }
    }

    return failedTests;
  }
}
