import { v4 as uuidv4 } from 'uuid';    // needed to generate UUIDs for each request
import request from 'request';          // needed to request Cardtokens
import crypto from 'crypto'             // needed to processe RSA encryption

//
// This is the merchantid created within Cardtokens
//
const MERCHANTID = "523ca9d5eb9d4ce0a60b2a3f5eb3119d"

//
// The apikey is required from the menu "settings" in Cardtokens
//
const APIKEY = "95f734793a424ea4ae8d9dc0b8c1a4d7"

//
// This is the Cardtokens API endpoint
//
const HOST = "https://api.cardtokens.io"

//
// The account public key used to encrypt card holder data. 
// The public key can be extracted from the Cardtokens backoffice from the
// menu "settings"
//
const PEMPUBLICKEY = "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0NCk1JSUNJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBZzhBTUlJQ0NnS0NBZ0VBMW1zdE1QckZSVmQ4VE1HclkzMjQNCjJwcTQ2aFlFMFBieXcrTnB0MnRDSjBpRHkrWkxQWWJGMnVYTkg1UE9neGkzdDVIVTY2MVVTQThYOXp5N2pJTzANCjlpOGxRMkdoN1dpejlqZXpFVDBpVmNvUGovSFFrV1N1KzA5Y0RIUk5qUDJoaWtIWUEwOUlZc05vemo3eHR2ME4NCnJxbjZacWZ5amhOS1NrN2RUeUVVQ0xoaEwvTUVFRTZ0QUREVVJZb0tIVXFrVml0cFlzcE1HamlKNkFBSVlVZWENCk1DdkZ2cnhaSkFNSW5FbnY3THNhTHVBV21pdzRrOXM5M0x1MXdoM3A1bjR1a09pVWpRWEZ5Nm9NNzMwblpvb1MNCmR2U2lYUlR2UlFwMDkyZDAzbnY5Zk55cWgwM3ZoM2l5TFJja3RoVnc2ZklPN3p4cktjTXpoVmhzK3doUGVtMzkNCkRhU05oSjFrZUx4bzcyaDJIL01FMzRuQzNOSUhCUEhQZ1NBeHVDSjlCcXVVRW1idXdGMTc0eDlGOUhFYm5jRlkNClRTd1hmS3diN1cxZ0F1U1RlWmhKVXc1eDZ6a3ZUTmRTejRWaFFjT051SjJ6am1VdGdSK3FXc1NjOUh2N1RGREgNCjlQbCt5NmQxeVJ0Rmp2TmlqeGZQUmo5a1dKbVJvcnBVVExUMTh2dThlbzg1aWNLTVY1VmladDMweGxpc1RVTjANCjJOWkxjNG83TVdraHE1eGhGcXhmZDdTZXZEc1FLa0VpenlRbi9zOUpZNmsybEtQUG4wTXk1UjdURWtBZEhVREUNCklIc09qTXlrZnpwYVdoNldMK2RmRlRFVzE4MFNkRHdXbEFXaWtpYWhFT1NDRGVFMkpWTDluMjY3QzJkc0ZJZDYNCjVPczJKVjE5anl5b2VGQkhOQm11MFBjQ0F3RUFBUT09DQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0NCg=="

//
// This is the example card holder data object filled with test data
//
var card_mastercard = {
  "pan": "5555341244441115",
  "expmonth": "06",
  "expyear": "2029",
  "securitycode": "000"
};

//
// The create token request object
//
var requestobj = {
	"enccard": "",
	"clientwalletaccountemailaddress": "noreply@cardtokens.io",
	"merchantid": MERCHANTID
};

//
// The RSA public key used to encrypt the card object and inject as base64 encoded data in the enccard object
//
const publickey= Buffer.from(PEMPUBLICKEY , 'base64').toString('utf8');

//
// Encrypt the card holder data using the public key
//
const encryptedData = crypto.publicEncrypt(
    {
      key: publickey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
      oaepHash: "sha256",
    },
    // We convert the data string to a buffer using `Buffer.from`
    Buffer.from(JSON.stringify(card_mastercard))
);

//
// Now transform the encrypted data into base64
//
var b64 = Buffer.from(encryptedData).toString('base64');

//
// Set the base64 encoded data into the enccard field on the request object
//
requestobj.enccard = b64;

//
// Transform the requestobject into json - we are good to go
//
var jsonrequest = JSON.stringify(requestobj);

//
// Generate HTTP request to create the token including the JSON payload
//
var options = {
  uri: HOST + '/api/token',
  method: 'POST',
  headers: {
      'content-type': 'application/json',
      'x-request-id': uuidv4(),
      'x-api-key': APIKEY,
      'Content-Length': Buffer.byteLength(jsonrequest),
      'User-Agent': 'Cardtokens/1.0'
  },
  json: requestobj
};

//
// Request Cardtokens to create the token
//
request(options, function (error, response, body) {
  
    //
    // If create token success
    //
    if (!error && response.statusCode == 200) {
        //
        // On success - print the internal Cardtokens tokenid
        //
        console.log("Token created by Cardtokens tokenid: " + body.tokenid + " and network token: " + body.token);

        //
        // Now generaet a cryptogram on behalf of this token
        //
        var requestobjcryptogram = {
            "reference": "thomask",
            "unpredictablenumber": "99887766"
        };

        //
        // Create the HTTP request including the cryptogram data
        //
        var options_cryptogram = {
            uri: HOST + '/api/token/' + body.tokenid + "/cryptogram",
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': APIKEY,
                'Content-Length': Buffer.byteLength(JSON.stringify(requestobjcryptogram)),
                'User-Agent': 'Cardtokens/1.0'
            },
            json: requestobjcryptogram
        };

        //
        // Now request for a cryptogram
        //
        request(options_cryptogram, function (error, response, body) {
        
        //
        // ON success
        //
        if (!error && response.statusCode == 200) {
            //
            // Print the cryptogram
            // 
            console.log(body.cryptogram);
            //
            // now fetch status of the token
            // 
            var options_status = {
                uri: HOST + '/api/token/' + body.tokenid + "/status",
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': APIKEY,
                    'User-Agent': 'Cardtokens/1.0'
                },
            };

            //
            // Request Cardtokens for the status of the token
            //
            request(options_status, function (error, response, body) {
                //
                // On get status success
                //
                if (!error && response.statusCode == 200) {
                    //
                    // Print the status of the token
                    //
                    console.log("success got status. The token has status: " + JSON.parse(body).status);

                    //
                    // Finally delete this token - go and create the delete request
                    //
                    var options_delete = {
                        uri: HOST + '/api/token/' + JSON.parse(body).tokenid + "/delete",
                        method: 'DELETE',
                        headers: {
                            'content-type': 'application/json',
                            'x-api-key': APIKEY,
                            'User-Agent': 'Cardtokens/1.0'
                        },
                    };

                    //
                    // On success
                    //
                    request(options_delete, function (error, response, body) {
                        //
                        // On success delete request
                        //
                        if (!error && response.statusCode == 200) {
                            console.log("Statuscode: " + response.statusCode + " - token is deleted");
                        }
                    });
                }
            });
        };
    });
  }
});