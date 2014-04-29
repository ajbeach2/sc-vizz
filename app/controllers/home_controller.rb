class HomeController < ApplicationController
    http_basic_authenticate_with name: "milkdrop", password: "481723123"
  def index
  end
end
