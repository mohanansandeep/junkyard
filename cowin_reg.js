// This script tries to automatically book a slot from the list of pincodes given.
// It will book the first available slot.
// beneficiaries [from networks tab in dashboard of CoWin or the ref number in your SMS when you register initially]
// dateSelect [choose the date trying to book the slot]

var pincodes = ["56000","56008","56008","56005","56001","56002","56004","56007","56009","560021","560004","560010","560016","560001","560022","560018","560023","560027","560008","560001","560021","560092","560008","560005","560027","560023","560003","560093","560001","560010","560013","560087","560010","560096","560032","560084","560038","560021","560039","560086","560040","560021","560037","560052","560076","560085","560047","560018","560023","560077","560057","560064","560054","560084","560040","560017","560097","560086","560032","560045","560056","560064","560079","560014","560020","560079","560018","560098","560073","560056","560092","560006","560022","560060","560039","560021","560003","560066","560051","560026","560084","560026","560032","560008","560018","560075","560010","560057","560037","560071","560002","560035","560001","560084","560079","560022","560032","560097","560047","560008","560021","560015","560037","560091","560005","560051","560057","560002","560094","560010","560058","560087","560084","560079","560063","560058","560008","560098","560021","560056","560003","560091","560026","560070","560033","560003","560051","560018","560016","560045","560002","560032","560022","560020","560096","560004","560096","560097","560079","560040","560026","560093","560040","560027","560054","560079","560095","560079","560010","560087","560010","560086","560079","560072","560077","560010","560011","560096","560068","560103","560057","560010","560040","560103","560076"];
var beneficiaries = ["XXXXXXXXXXX"];

var dateSelect = "03-05-2021";
var numDays = 1;

var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);


function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

 function fetchByPincode() {
    console.log("Fetching By Pin")
	tempDate = new Date();
    for (let d = 0; d < numDays; d++) {
		   if(d!=0){
				tempDate.setDate(tempDate.getDate() + 1);
		   }
		  
		   console.log(tempDate); 
		 dateSelect =  ("0" + tempDate.getDate()).slice(-2) + "-" + ("0"+(tempDate.getMonth()+1)).slice(-2) + "-" +    tempDate.getFullYear()
		
    for (i=0;i < pincodes.length; i++) {
        url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode="+pincodes[i]+"&date="+dateSelect;
        a = httpGet(url);
        try {
          a = JSON.parse(a)
        } catch(e) {
          continue;
        }
        for (c in a.centers) {
        for (s in a.centers[c].sessions) {
              if (a.centers[c].sessions[s].min_age_limit < 45 && a.centers[c].sessions[s].available_capacity > 0) {
                console.log("Trying to Book for", a.centers[c].pincode, a.centers[c].name, a.centers[c].sessions[s].available_capacity);
                data = {
                  center_id: a.centers[c].center_id,
                  session_id: a.centers[c].sessions[s].session_id,
                  dose: 1,
                  slot: a.centers[c].sessions[s].slots[0],
                  beneficiaries: beneficiaries
                }
				
                upload(data,  a.centers[c].pincode, a.centers[c].name, a.centers[c].sessions[s].available_capacity);
                return;
              }
          }
        }
		
     }
	 }
	
}

function upload(data, pincode, name, available_capacity) {
  console.log('upload start for '+pincode);
  return $.ajax({
      type: "POST",
      url: "https://cdn-api.co-vin.in/api/v2/appointment/schedule",
      data: data,
      timeout: 3000,
      success: function(result) {
        console.log('Dumping Result Log');
        console.log(result);
        console.log('Booking Success');
        clearInterval(timerClock);
      },
	  error: function (textStatus, errorThrown) {
                 console.log("Error for "+pincode+" "+name)
				// console.log(err.Message);
            }
	 
	  
  });
}


var timerClock = setInterval(fetchByPincode, 10000);
