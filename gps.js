const updateLocation = (e, options) => {
  if (study && study.options && study.options.datastore){
    if(options.commitNewLine){
      study.options.datastore.commit(e.detail) // create a new line in the dataset
    } else {
      study.options.datastore.set(e.detail) // create/replace the current line in the dataset
    }
    console.log('Options are', options, ' - updated the location', e.detail)
  }
}

class GPSPlugin {
  constructor(options) {
    console.log('TestPlugin initialized with options', options)
    this.enableHighAccuracy = false
    this.watchPosition = true
    this.commitNewLine = false
  }

  handle(context, event) {
    console.log(`Handling ${ event } on`, context)

    if(event == 'plugin:init'){
      if(!('geolocation' in navigator)){
        study.options.datastore.set({'gps_erros': 'GPS is not available in the browser'})
        return
      }
      window.addEventListener('gps_data', (e) => {updateLocation(e, this)})

      const handlePosition = position => {
        let event = new CustomEvent('gps_data',
          {
            detail: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
              gps_timestamp: new Date(position.timestamp),
            }
          })
        window.dispatchEvent(event)
      }

      const handleError = error => {
        console.error(err)
        study.options.datastore.set({'gps_erros': err.message})
      }

      const options = {
        enableHighAccuracy: this.enableHighAccuracy,
      }

      if(this.watchPosition){
        window.watchId = navigator.geolocation.watchPosition(handlePosition, handleError, options)
      } else {
        window.watchId = navigator.geolocation.getCurrentPosition(handlePosition, handleError, options)
      }

    }

    if (event == "end"){
      window.removeEventListener('changelocation', updateLocation)
      navigator.geolocation.clearWatch(watchId)
      console.log("Cleaning watch id", window.watchId)
    }
  }

}

window.GPSPlugin = GPSPlugin
