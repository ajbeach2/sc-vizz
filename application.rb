require 'rubygems'
require 'bundler'

Bundler.require

class App < Sinatra::Base

  set :root, File.dirname(__FILE__)
  set :protection, true

  register Sinatra::AssetPack
  register Sinatra::Export
  helpers Sinatra::ContentFor

  assets do
    serve '/js',     from: 'app/js'        # Default
    serve '/css',    from: 'app/css'       # Default
    serve '/images', from: 'app/images'    # Default

    # The second parameter defines where the compressed version will be served.
    # (Note: that parameter is optional, AssetPack will figure it out.)
    # The final parameter is an array of glob patterns defining the contents
    # of the package (as matched on the public URIs, not the filesystem)
    js :app, [
      '/js/*.js',
      '/js/lib/**/*.js'
    ]

    css :application, [
      '/css/*.css'
    ]

    js_compression  :uglify
    css_compression :sass
  end


  error RuntimeError do
    status 500
    "A RuntimeError occured"
  end

  get '/' do
    haml :"pages/index"
  end

  run! if app_file == $0
end
