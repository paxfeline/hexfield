require "test_helper"

class HexfieldControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get hexfield_index_url
    assert_response :success
  end
end
