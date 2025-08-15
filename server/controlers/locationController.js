const axios = require('axios');

exports.calculateDistanceAndEta=async(origin,destination)=>{
    const apiKey = process.env.ORS_API_KEY;
    const url = `https://api.openrouteservice.org/v2/matrix/driving-car`;
    try{
        const response = await axios.post(url, {
          locations: [
            [origin.lng, origin.lat], // OpenRouteService uses [lng, lat] 
            [destination.lng, destination.lat]
          ],
          metrics:['distance','duration'],
          units: 'm' // Use meters for distance
        },{
            headers:{
                'Authorization' : apiKey,
                'Content-Type': 'application/json'
            }  
        });
        const distanceKm = response.data.distances[0][1]/1000; //km
        const durationSec = response.data.durations[0][1]; //sec

        return{
            distance:`${distanceKm.toFixed(2)} km`, //Format to 2 decimal places
            duration:`${Math.round(durationSec / 60)} mins` //
        }

    }catch(error){
        console.error('Error calculating distance and ETA:',error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

exports.getRoute=async (req, res) => {
    const {start, end} = req.body;
    const apiKey = process.env.ORS_API_KEY;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`
    try{
        const response = await axios.post(url, {
            coordinates: [
                [start.lng, start.lat], //OpenRouteService uses [lng, lat]
                [end.lng, end.lat]
            ]
        }, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }  
        });

        res.status(200).json(response.data);
    } catch (error){
      console.error('Error getting route:', error);
      res.status(500).json({ error: 'Failed to get route'});
    }

}