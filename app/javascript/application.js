// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

if ('serviceWorker' in navigator) {
  // Register the service worker
  navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Service Worker registered with scope:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service Worker registration failed:', error);
  });
}

/*
if ('serviceWorker' in navigator) {
  // Register the service worker
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registered:', registration);
      const sw = registration.installing || registration.waiting || registration.active;
      window.sw = sw;
      sw.addEventListener('statechange', (event) => {
        console.log(event)
    });
    })
    .catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });
}
    */