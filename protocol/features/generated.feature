
Feature tests for the Solid Lite specification.

These tests are adapted from https://github.com/solid-lite/draft-spec, which is a subset of the evolving Solid platform, which is based on underlying RFCs (Requests for Comments).
These are all specifications develped in rigourous, transparent community processes.

Start Solid Lite routes and the web server. First we start some routes on the web server, and describe some resources (resource and profile).

  start solid lite routes
  webserver is listening
  set resource to http://localhost:8123/data/resource
  set profile to http://localhost:8123/profile.html
  set post data to "{ "data": "new" }"

We start at Feature 2, the HTTP tests. Hypertext Transfer Protocol (HTTP) is the main protocol of the Web.
A web server that supports Solid must "speak" HTTP in a precise way.

Each test includes a Fulfills statement, which is extracted from the corresponding base RFC.

Feature: 2. Hypertext Transfer Protocol (HTTP)

Scenario: Validate HTTP GET Method for Resource Accessibility
Fulfills: Servers MUST support the HTTP GET method [RFC7231]

HTTP servers return status codes, 200 is the status code for OK.

Set OK to 200

As a user using a browser, I expect to click on links and see the requested pages without errors, which requires support for the HTTP GET method.
This test verifies the resource can be retrieved, that it's HTML format, and it contains expected text.

  http get from profile webpage returns status OK
  http get from profile webpage returns content-type "text/html"
  http get from profile webpage contains Ace

Scenario: Validate HTTP HEAD Method for Efficient Meta-information Retrieval
Fulfills: Servers MUST support the HTTP HEAD method [RFC7231]

As a user, I want my browser to handle operations behind the scenes efficiently, such as checking for content updates, which uses the HEAD method.

  http head from profile webpage returns status OK
  http head from profile webpage returns content-type "text/html"
  http head from profile webpage returns no content

Scenario: Validate HTTP OPTIONS Method for Browser Compatibility
Fulfills: Servers MUST support the HTTP OPTIONS method [RFC7231]

As a user, I expect my browser to determine how it can interact with a site, and the OPTIONS method provides this capability.
An HTTP OPTIONS request returns a 204 "No Content" status code to indicate that the preflight check was successful and no further content is needed, ensuring the subsequent requests align with the server's CORS policy.

Set No Content to 204

  http options from profile webpage returns status No Content
#  http options from profile webpage returns header "Allow" with "GET, HEAD, OPTIONS, PUT, DELETE"

Scenario: Validate HTTP PUT Method for Updating Content
Fulfills: Servers MUST support the HTTP PUT method [RFC7231]

As a user, when I edit or upload content through my browser, I expect it to be saved and confirmed by the server, which is done using the PUT method.

Set Created to 201

  http put to resource webpage with type 'application/json' body post data returns status Created
#  see '201 Created' or '204 No Content'

Scenario: Validate HTTP DELETE Method for Content Removal
Fulfills: Servers MUST support the HTTP DELETE method [RFC7231]

As a user with permissions, when I choose to delete content from a webpage, I expect this action to be processed by the server using the DELETE method.

  http delete to resource webpage returns status OK
#  Then I see '200 OK' or '204 No Content'

Scenario: Validate CORS Headers for Cross-Origin Interactions
Fulfills: Servers MUST include the Access-Control-Allow-Origin header with the value `*`
Fulfills: Servers MUST include the Access-Control-Allow-Methods header with the value `GET, HEAD, OPTIONS, PUT, DELETE, POST`
Fulfills: Servers MUST include the Access-Control-Allow-Headers header with the value `Content-Type`

As a user, I expect to use web applications that request resources from different domains seamlessly, which requires the server to set CORS headers correctly.

#  http options from profile webpage returns header "Access-Control-Allow-Origin" with "GET, HEAD, OPTIONS, PUT, DELETE"
#  When I send a 'GET' request to resource webpage from 'http://another-origin.com'
#  Then I see 'Access-Control-Allow-Origin: *'
#  And I see 'Access-Control-Allow-Methods: GET, HEAD, OPTIONS, PUT, DELETE, POST'
#  And I see 'Access-Control-Allow-Headers: Content-Type'

At the end of the test, the parsed spec is checked for MUST statements, to make sure there's at least one test for every statement.

# Pending some refactoring of https://github.com/withhaibun/haibun/tree/main/modules/parse-md
#All MUST statements are fulfilled
