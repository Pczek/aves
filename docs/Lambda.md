# AWS Lambda

+ [Docs](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
+ [Lambda+API Gateway](https://docs.aws.amazon.com/lambda/latest/dg/with-on-demand-https.html)
+ [Lambda Proxy Integration (HTTP Status codes)](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html#api-gateway-proxy-integration-lambda-function-nodejs)

## Pricing

+ [Pricing](https://aws.amazon.com/lambda/pricing/)

| Memory (MB) | Price per 100ms ($) |
| ----------- | ------------------- |
| 128	      | 0.000000208         | 
| 192         | 0.000000313         |

## Limitations

### AWS Lambda Resource Limits

| Resource                                | Default Limit          |
| --------------------------------------- | ---------------------- |
| Ephemeral disk capacity                 | ("/tmp" space)	512 MB | 
| Number of file descriptors	          | 1,024                  |
| Number of processes and threads         | (combined total) 1,024 |
| Maximum execution duration per request  |	300 seconds            |
| Invoke request body payload size        | (RequestResponse) 6 MB |
| Invoke request body payload size        | (Event)	128 K          |
| Invoke response body payload size       | (RequestResponse) 6 MB |