# TODO we should switch to ActionController::API for the base classes
# One of the specs are failing when i tried doing that, lets revisit in future
class PublicController < ActionController::Base
  skip_before_action :verify_authenticity_token
end
