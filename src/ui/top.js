
import { Component, xml, loadFile, onWillStart } from "@odoo/owl";
// import './App.scss'
import modelsXml from "../assets/models.xml";
console.log(modelsXml)

export class Top extends Component {
    static template = xml`<h1>Hello</h1>`
    setup(){
        onWillStart(async ()=>{

            // const ModelsXML = await loadFile('/static/models.xml');
            // console.log(ModelsXML)
        })
        this.models = modelsXml.models;
    }
    
}
Top.template = xml`
    <div>
        <select>
            <option t-foreach="models" t-as="model" t-key="models_index" t-attvalue="model.name" t-out="model.name" />
        </select>
    </div>
`