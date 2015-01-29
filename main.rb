require 'sinatra'
require 'active_record'
require 'yaml'
require "json"
require "json-fuzz-generator"
require 'logger'

# start setting for server run 
set :environment, :production
enable :method_override

# connecting databases
config = YAML.load_file('database.yml')
ActiveRecord::Base.establish_connection(config["prod"])

# log setting
logger = Logger.new(STDOUT)

#db override
class ReadEngTexts < ActiveRecord::Base
end

helpers do
    #自前で書かないとpartial出来んらしい
    def partial(template, options={})
        erb "_#{template}".to_sym, options.merge(:layout => false)
    end
end

# main codes
get '/' do
  erb :index
end

post'/generate_data.json' do
    content_type :json
    eng       = ReadEngTexts.new
    eng.title = @params[:title]
    eng.text  = @params[:text]
    eng.save
    ReadEngTexts.all.to_json
end

get'/generate_data.json' do
    content_type :json
    ReadEngTexts.all.to_json
end

get '/text_detail.json' do
    content_type :json
    ReadEngTexts.find(@params[:id]).to_json
end

delete '/text_detail.json' do
    content_type :json
    ReadEngTexts.find(@params[:id]).delete
    { :status => "sucsess" }.to_json
end
