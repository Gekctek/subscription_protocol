import Text "mo:base/Text";
import Blob "mo:base/Blob";
import IC "mo:base/ExperimentalInternetComputer";
import Cycles "mo:base/ExperimentalCycles"

actor RSSBridge {

    type IC = actor {
        http_request : (HttpRequest) -> async (HttpResponse);
    };

    let ic : IC = actor ("aaaaa-aa");

    type HeaderField = { name : Text; value : Text };

    type HttpResponse = {
        status : Nat;
        headers : [HeaderField];
        body : Blob;
    };

    type HttpRequest = {
        url : Text;
        max_response_bytes : ?Nat64;
        method : { #get; #head; #post };
        headers : [HeaderField];
        body : ?Blob;
        // transform : ?{
        //     #function : query (HttpResponse) -> async (HttpResponse);
        // };
    };

    type AddResponse = {
        #badStatusCode : Nat;
        #ok : ?Text;
    };
    public shared ({ caller }) func add(feedUrl : Text) : async AddResponse {
        let request : HttpRequest = {
            url = feedUrl;
            max_response_bytes = null;
            method = #get;
            headers = [];
            body = null;
            transform = null;
        };
        Cycles.add(1_000_000_000_000);
        let response = await ic.http_request(request);
        if (response.status >= 200 and response.status < 300) {
            let s = Text.decodeUtf8(response.body);
            #ok(s);
        } else {
            #badStatusCode(response.status);
        };
    };
};
