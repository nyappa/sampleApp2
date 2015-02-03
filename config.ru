require './main.rb'
require 'pit'

use Rack::Auth::Basic do |username, password|
    config = Pit.get('eng_study_basic')
    username == config['name'] && password == config['password']
end

run MainApp
