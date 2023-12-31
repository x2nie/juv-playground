//@ts-nocheck
import { X2jOptions, XMLParser } from 'fast-xml-parser';

var options0 = {
    ignoreAttributes: false,
    // attributeNamePrefix : "@a_",
    attributeNamePrefix: "",
    // attributesGroupName : "_g_",
    attrPrefix: "@attr_",
    textNodeName: "#text",
    ignoreNonTextNodeAttr: true,
    ignoreTextNodeAttr: true,
    ignoreNameSpace: true,
    ignoreRootElement: false,
    textNodeConversion: true,
    textAttrConversion: false,

    preserveOrder: true,
    parseAttributeValue: true,
    allowBooleanAttributes: true, // To allow attributes without value.
    arrayMode: true
}

export default function XMLLoader2(options?: Partial<X2jOptions>) {
    return {
        name: 'xml-loader',
        async transform(_: string, id: string) {
            const xmlRegEx = /\.xml$/;
            if (xmlRegEx.test(id)) {
                // const xml = readFileSync(id).toString();
                const xml = _;
                const parser = new XMLParser({ ...options0, ...options });
                const convertedObj = await parser.parse(xml);
                const simpleObject = beautify(convertedObj[0])
                const buf = JSON.stringify(simpleObject);
                return {
                    code: `export default ${buf}`,
                };
            }
            return {};
        },
    };
}

const sample_js = [
    {
        "models": [
            {
                "model": [],
                ":@": {
                    "name": "Apartemazements",
                    "size": 8,
                    "d": 3
                }
            },
            {
                "model": [
                    {
                        "color": [],
                        ":@": {
                            "symbol": "I",
                            "value": "abcbe8",
                            "comment": "sea"
                        }
                    },
                    {
                        "color": [],
                        ":@": {
                            "symbol": "U",
                            "value": "cee6f9",
                            "comment": "coast and lakes"
                        }
                    }
                ],
                ":@": {
                    "name": "Island",
                    "size": 400,
                    "steps": -1,
                    "pixelsize": 1
                }
            },
            {
                "model": [],
                ":@": {
                    "name": "CarmaTower",
                    "length": 12,
                    "width": 12,
                    "height": 18
                }
            }
        ]
    }
]

function mergeUpAttributes(ori: object) {
    let o = {}; //{...ori[':@']}
    // for (const [key, value] of Object.entries(object1)) { // ES2017
    for (const key in ori) {
        if(key==':@'){
            o = {...o, ...ori[':@']}
        } else if(key=='#text') {
            //ignore text
        } else {
            o['Tag'] = key
            // console.log(`ori.key='${key}'`)
            o['childNode'] = ori[key].map(mergeUpAttributes)
        }
    }
    return o;
}

function beautify(js: object) {
    const firstKey = Object.keys(js)[0];
    // console.log(`firstkey: ${firstKey}  values:${JSON.stringify(js)}`)
    js[firstKey] = (js[firstKey] || []).map( mergeUpAttributes )
    return js
}