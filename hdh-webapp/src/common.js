export var api = ""
if (process.env.REACT_APP_STAGE === "local") {
    api = "http://localhost:5000/healthdatahelp-e4ab1/us-central1/v1"
} else {
    // throw "meals api no defined";
    api = "https://us-central1-healthdatahelp-e4ab1.cloudfunctions.net/v1"
}
