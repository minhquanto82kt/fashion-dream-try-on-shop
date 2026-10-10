# Python Reports

This directory stores reproducible reports produced by the Python AI backend workflow.

## What belongs here

- Benchmark summaries for image validation, normalization, resizing, and encoding.
- Test or evaluation summaries that include the command used, environment, sample size, and date.
- AI provider latency, failure-rate, and cost comparisons when measured from actual runs.

## Reporting rules

- Do not commit secrets, access tokens, private user images, or personal data.
- Do not present estimates as measured results. Include the test setup and command so results can be reproduced.
- Keep benchmark scripts and fixtures in `../benchmarks/` or `../tests/`; put the written summary and relevant aggregate results here.
- Avoid committing bulky raw logs or generated image files. Link to CI artifacts when appropriate.
- Record the Git commit SHA and runtime/dependency versions for results that may change between environments.

## Suggested report format

1. Goal and scope
2. Environment and dependency versions
3. Dataset/sample characteristics (without personal data)
4. Exact command and procedure
5. Results and limitations
6. Conclusion and follow-up actions

No benchmark results are included until they have actually been run and verified.
