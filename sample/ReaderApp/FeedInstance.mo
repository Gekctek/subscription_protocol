import Content "../../src/Content";
import List "mo:base/List";

actor class FeedInstance() {

    private stable var content : List.List<Content.Content> = List.nil<Content.Content>();

    public func pushContent(content : Content.Content) : async () {
        content.push(content);
    };
};
