Feature: 2. Hypertext Transfer Protocol (HTTP)

Scenario: Validate HTTP GET Method for Resource Accessibility
Fulfills: Servers MUST support the HTTP GET method [RFC7231]

As a user using a browser, I expect to click on links and see the requested pages without errors, which requires support for the GET method.

  When I go to the 'http://example.com/resource' webpage
  Then I see '200 OK'
  And I see 'Content-Type: application/json'

Scenario: Validate HTTP HEAD Method for Efficient Meta-information Retrieval
Fulfills: Servers MUST support the HTTP HEAD method [RFC7231]

As a user, I want my browser to handle operations behind the scenes efficiently, such as checking for content updates, which uses the HEAD method.

  When I send a 'HEAD' request to 'http://example.com/resource'
  Then I see '200 OK'
  And the response headers should be present without a body

Scenario: Validate HTTP OPTIONS Method for Browser Compatibility
Fulfills: Servers MUST support the HTTP OPTIONS method [RFC7231]

As a user, I expect my browser to determine how it can interact with a site, and the OPTIONS method provides this capability.

  When I send an 'OPTIONS' request to 'http://example.com/resource'
  Then I see '200 OK'
  And I see 'Allow: GET, HEAD, OPTIONS, PUT, DELETE'

Scenario: Validate HTTP PUT Method for Updating Content
Fulfills: Servers MUST support the HTTP PUT method [RFC7231]

As a user, when I edit or upload content through my browser, I expect it to be saved and confirmed by the server, which is done using the PUT method.

  Given I set 'method' to 'PUT'
  And I set 'Content-Type' to 'application/json'
  When I send a request to 'http://example.com/resource' with body '{ "data": "new" }'
  Then I see '201 Created' or '204 No Content'

Scenario: Validate HTTP DELETE Method for Content Removal
Fulfills: Servers MUST support the HTTP DELETE method [RFC7231]

As a user with permissions, when I choose to delete content from a webpage, I expect this action to be processed by the server using the DELETE method.

  Given I set 'method' to 'DELETE'
  When I send a request to 'http://example.com/resource'
  Then I see '200 OK' or '204 No Content'

Scenario: Validate CORS Headers for Cross-Origin Interactions
Fulfills: Servers MUST include the Access-Control-Allow-Origin header with the value `*`
Fulfills: Servers MUST include the Access-Control-Allow-Methods header with the value `GET, HEAD, OPTIONS, PUT, DELETE, POST`
Fulfills: Servers MUST include the Access-Control-Allow-Headers header with the value `Content-Type`

As a user, I expect to use web applications that request resources from different domains seamlessly, which requires the server to set CORS headers correctly.

  When I send a 'GET' request to 'http://example.com/resource' from 'http://another-origin.com'
  Then I see 'Access-Control-Allow-Origin: *'
  And I see 'Access-Control-Allow-Methods: GET, HEAD, OPTIONS, PUT, DELETE, POST'
  And I see 'Access-Control-Allow-Headers: Content-Type'
