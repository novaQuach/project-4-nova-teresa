// Create app namespace to hold all methods
const zomatoUrl = 'https://developers.zomato.com/api/v2.1';
const app = {
    baseUrl: zomatoUrl,
    locationsUrl: zomatoUrl + '/locations',
    cuisineUrl : zomatoUrl + '/cuisines',
    restaurantUrl: zomatoUrl + '/search',
    key: '96da6937114a6901ec154be1338c5427',
};

app.url = 'https://developers.zomato.com/api/v2.1/location_details?entity_id=89&entity_type=city';


app.setupLocationForm = function () {
    $('.searchBar').on('submit', function (e) {
        e.preventDefault();
        app.userInput = $('#userInput').val();
        app.getLocation(app.userInput)
            .then(() => {
                displayCity(app.locationName);
                return app.getCuisine(app.locationId);
            })
            .then(() => {
                $('#cuisines').get(0).scrollIntoView(true);
            })
        console.log(app.userInput)
    });
}


/**
 * Make AJAX request with user inputted data
 * @param query User input for location
 */
app.getLocation = function(query) {
    return $.ajax({
        method: 'GET',
        crossDomain: true,
        url: app.locationsUrl,
        dataType: 'json',
        async: true,
        headers: {
            'user-key': app.key
        },
        data: {
            query: query
        },
    }).then((res) => {
        console.log(res);

        if (res.location_suggestions.length > 0) {
            app.locationId = res.location_suggestions[0].city_id; //returns a number 
            app.locationName = res.location_suggestions[0].city_name;
    
        } else {
            $('#userInput').val(''); //set the string of userInput back to an empty string
           
            swal('No results. Please enter a valid City!')
                .then(() => {
                    $('#userInput').focus();
                })
            throw "No results"; // When locationId is null, throw an exception to skip the 'then' block in onsetupLocationForm.
        }
    });
};

const displayCity = function(locationName){
    $('.cityName').empty();
    $('#cuisines').prepend(`<h2 class="cityName"><span class="preTitle">Looking in</span>${locationName}</h2>`)
}

app.getCuisine = function(city_id) {
    console.log('getCuisine', city_id)
    return $.ajax({
        method: 'GET',
        crossDomain: true,
        url: app.cuisineUrl,
        dataType: 'json',
        async: true,
        headers: {
            'user-key': app.key
        },
        data: {
            city_id: city_id
        },
    }).then((res) => {
        // console.log(res)
        app.getCuisineArray(res);
        // jquery navigate fn
    });
};

app.setupCuisineForm = function () {
    $('.cuisinesForm').on('submit', function (e) {
        e.preventDefault();
        app.userCuisine = $('#selectCuisines option:selected').val();
        console.log('cuisine id is ',app.userCuisine);// returns the cuisineID

        app.getRestaurant(app.userCuisine)
            .then((res) => {
                console.log('rest info returned from API', res)
                
                const restDetails = app.getRestaurantDetails(res);
                app.displayRestaurantDetails(restDetails);
                
                $('.resultsSection').get(0).scrollIntoView(true);
                $('#setupCuisineForm').prop("disabled", true);
            });
    });
}



/**
 * cuisineArray is an array of objects that has two properties : cuisine_id and cuisine_name
 * cuisineEntry is the indiviudal objects we are looking at in each 'cuisines array' returned by API call
 */
 app.getCuisineArray = function (res){
    //  console.log('in cuisine array',res)
   app.cuisineArray = res.cuisines.map(function(cuisineEntry){
        return cuisineEntry.cuisine
    });
    console.log('this is the cuisineArray', app.cuisineArray);
    // create UI  (dropbox)
    // selecting cuisines, pass in the array of objects cuisine, extract the name to display , but id is 
    
    app.cuisineArray.forEach(cuisine => {
        $('#selectCuisines').append(`<option value="${cuisine.cuisine_id}">${cuisine.cuisine_name}</option>`)
    });
    return app.cuisineArray;
} 


//access the cuisineArray to get the cuisineName and pass into the serach call 
app.getRestaurant = function (cuisine_id) {
    return $.ajax({
        method: 'GET',
        crossDomain: true,
        url: app.restaurantUrl,
        dataType: 'json',
        async: true,
        headers: {
            'user-key': app.key
        },
        data: {
            cuisines: cuisine_id
        },
    });
};

app.getRestaurantDetails = function (res) {
    const restaurantObject = res.restaurants[Math.floor(Math.random() * res.restaurants.length)].restaurant;
    console.log(restaurantObject);

    const restDetails = {
        name: restaurantObject.name,
        categories: restaurantObject.cuisines,
        price_range_symbol: getPriceRangeSymbol(restaurantObject.price_range),
        // currency: restaurantObject.currency,
        address: restaurantObject.location.address,
        rating: restaurantObject.user_rating.aggregate_rating,
        photos_url: restaurantObject.photos_url,
        menu_url: restaurantObject.menu_url,
    };
    console.log(restDetails);

    return restDetails;
}


const getPriceRangeSymbol = function getPriceRange(price_range){
    const priceRangeSymbols = [ '$', '$$', '$$$','$$$$','$$$$$'];
    return priceRangeSymbols[price_range - 1];
};
 

app.displayRestaurantDetails = function (restDetails){
    $('.cuisineResults').empty()
    $('.cuisineResults').append(
        `<h2 class="restTitle"> ${restDetails.name} </h2>
        <div><span class="infoTitle">Categories</span>${restDetails.categories}</div>
        <div><span class="infoTitle">Price range</span>${restDetails.price_range_symbol}</div>
        <div><span class="infoTitle">Rating<span>${restDetails.rating}</div>
        <div><span class="infoTitle">Address</span>${restDetails.address}</div>
        <div><span class="infoTitle">Photos</span><a href='${restDetails.photos_url}' target='_blank'>Photos here</a></div>
        <div><span class="infoTitle">Menu</span><a href='${restDetails.menu_url}' target='_blank'>Menu here</a></div>
        `
        // < div > <span class="infoTitle"></span></div >
        // <div><span class="infoTitle"></span></div>

        );
}






// Start app
app.init = function () {
    app.setupLocationForm();
    app.setupCuisineForm();
};

//document ready 
$(function () {
    app.init();
}); //document  ready ends 

// app.geolocateUser = function() {
//     var options = {
//         enableHighAccuracy: true,
//         timeout: 5000,
//         maximumAge: 0
//     };

//     function success(pos) {
//         var crd = pos.coords;

//         console.log('Your current position is:');
//         console.log(`Latitude : ${crd.latitude}`);
//         console.log(`Longitude: ${crd.longitude}`);
//         console.log(`More or less ${crd.accuracy} meters.`);
//     }

//     function error(err) {
//         console.warn(`ERROR(${err.code}): ${err.message}`);
//     }

//     navigator.geolocation.getCurrentPosition(success, error, options);
// }



