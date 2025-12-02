interface HtmlCssPreviewProps {
    html:string;
    css?:string;
}

export default function HtmlCssPreview({html='', css=''}:HtmlCssPreviewProps) {
    const document = `
        <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <style>
            ${css}
        </style>
        ${html}        
    </body>
    </html>
    `
    return (
        <iframe
            title="HTML CSS Preview"
            sandbox="allow-scripts allow-same-origin"
            style={{width: '100%', height: '100%', border: 'none'}}
            srcDoc={document}
        />
    )
}
