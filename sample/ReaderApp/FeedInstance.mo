import Content "../../src/Content";
import List "mo:base/List";

actor class FeedInstance() {

    private stable var feed : List.List<Content.Content> = List.nil<Content.Content>();

    public func pushContent(content : Content.Content) : async () {
        feed := List.push(content, feed);
    };

    public func getFeed() : async [Content.Content] {
        List.toArray(feed);
    };
};
