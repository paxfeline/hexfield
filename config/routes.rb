Rails.application.routes.draw do
  #get "hexfield/index" # don't want/need
  devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  
  #hexfield
  resources :projects, except: [:edit]
  get "edit" => "hexfield#edit"
  # files
  post "api/get-project" => "hexfield#get_project"
  post "api/get-code-files" => "hexfield#get_code_files"
  post "api/get-media-files" => "hexfield#get_media_files"
  post "api/upload-code-files" => "hexfield#upload_code_file"
  post "api/upload-media-files" => "hexfield#upload_media_file"
  post "api/get-code-file" => "hexfield#private_get_code_file"
  post "api/get-media-file" => "hexfield#private_get_media_file"

  get "home/:user/:project/:file" => "hexfield#public_get_code_file"
  get "home/:user/:project/media/:file" => "hexfield#public_get_media_file"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "hexfield#index"
end
