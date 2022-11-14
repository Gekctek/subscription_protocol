export type Content =
    | HtmlContent
    | TextContent;

export type HtmlContent = {
    format: "html";
    title: string;
    body: string;
};

export type TextContent = {
    format: "txt";
    title: string;
    body: string;
};