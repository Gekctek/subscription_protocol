import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Channel "../../src/Channel";
import Feed "../../src/Feed";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Content "../../src/Content";
import Iter "mo:base/Iter";
import Xml "Xml";
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
        #failedRSSXmlParse : ?Text;
        #failedXmlDeserialization : Xml.File;
        #ok : [Content.Content];
    };

    public shared func push(feedUrl : Text) : async () {
        let response = await get(feedUrl);
        switch (response) {
            case (#ok(contentList)) {
                let feed : Feed.Actor = actor ("qoctq-giaaa-aaaaa-aaaea-cai");
                for (content in Iter.fromArray(contentList)) {
                    let result = await feed.channelCallback({
                        message = #newContent(content);
                        channelId = "11";
                    });
                };
            };
            case (_) return;
        };
    };

    public shared ({ caller }) func add(feedUrl : Text) : async AddResponse {
        await get(feedUrl);
    };

    private func get(feedUrl : Text) : async AddResponse {
        let request : HttpRequest = {
            url = feedUrl;
            max_response_bytes = null;
            method = #get;
            headers = [];
            body = null;
            transform = null;
        };
        Cycles.add(1_000_000_000_000); // TODO
        let response = await ic.http_request(request);
        let r = Cycles.refunded();
        if (response.status >= 200 and response.status < 300) {
            switch (Xml.parseFileBytes(response.body)) {

                case (#err(e)) {
                    let rawXml = Text.decodeUtf8(response.body);
                    return #failedRSSXmlParse(rawXml);
                };
                case (#ok(xmlFile)) {
                    if (xmlFile.root.name != "feed") {
                        return #failedXmlDeserialization(xmlFile);
                    };
                    let entries = switch (xmlFile.root.children) {
                        case (#open(c)) Array.mapFilter<Xml.NodeOrText, Xml.Node>(
                            c,
                            func(nT) {
                                switch (nT) {
                                    case (#node(n)) {
                                        if (n.name == "entry") {
                                            ?n;
                                        } else {
                                            null;
                                        };
                                    };
                                    case (_) null;
                                };
                            },
                        );
                        case (#selfClosing) return #failedXmlDeserialization(xmlFile);
                    };

                    let content = Buffer.Buffer<Content.Content>(1);
                    for (entry in Iter.fromArray(entries)) {
                        switch (getContentFromEntry(entry)) {
                            case (null) return #failedXmlDeserialization(xmlFile);
                            case (?e) content.add(e);
                        };
                    };
                    return #ok(content.toArray());
                };
            };
        } else {
            #badStatusCode(response.status);
        };
    };

    private func getContentFromEntry(entry : Xml.Node) : ?Content.Content {
        do ? {
            if (entry.name != "entry") {
                return null;
            };
            let children = switch (entry.children) {
                case (#open(c)) c;
                case (#selfClosing) return null;
            };
            let fields : [Xml.Node] = Array.mapFilter(
                children,
                func(c : Xml.NodeOrText) : ?Xml.Node {
                    switch (c) {
                        case (#node(n)) ?n;
                        case (_) null;
                    };
                },
            );
            let title = getTextValue(fields, "title")!;
            let contentText = getTextValue(fields, "content")!;
            let link = getFieldValue(
                fields,
                "link",
                func(n : Xml.Node) : ?Text {
                    let attribute = Array.find<Xml.Attribute>(
                        n.attributes,
                        func(a) {
                            a.name == "href";
                        },
                    );
                    switch (attribute) {
                        case (null) null;
                        case (?a) a.value;
                    };
                },
            )!;
            let dateText = getTextValue(fields, "updated")!;
            let authors : ?[Content.Author] = getFieldValue<[Content.Author]>(
                fields,
                "author",
                func(f) {
                    switch (f.children) {
                        case (#open(names)) {
                            return ?Array.mapFilter<Xml.NodeOrText, Content.Author>(
                                names,
                                func(n) {
                                    switch (n) {
                                        case (#text(t)) ?#name(t);
                                        case (_) null;
                                    };
                                },
                            );
                        };
                        case (_) return null;
                    };
                },
            );
            return ?{
                title = title;
                body = {
                    format = ?"text/html";
                    value = contentText;
                };
                link = link;
                authors = switch (authors) { case (null)[]; case (?a) a };
                imageLink = null;
                language = null;
                date = 0; // TODO
            };
        };
    };

    private func getTextValue<T>(fields : [Xml.Node], name : Text) : ?Text {
        getFieldValue<Text>(
            fields,
            name,
            func(n : Xml.Node) : ?Text {
                switch (n.children) {
                    case (#open(c)) {
                        switch (c[0]) {
                            case (#text(t)) ?t;
                            case (_) null;
                        };
                    };
                    case (_) null;
                };
            },
        );
    };

    private func getFieldValue<T>(fields : [Xml.Node], name : Text, mapFunc : (Xml.Node) -> ?T) : ?T {
        do ? {
            let node : Xml.Node = Array.find<Xml.Node>(
                fields,
                func(f) {
                    f.name == name;
                },
            )!;
            mapFunc(node)!;
        };
    };
};
