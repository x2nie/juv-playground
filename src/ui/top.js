
import { Component, xml, loadFile, onWillStart } from "@odoo/owl";
// import './App.scss'
import models from "../assets/models.xml";
console.log(models)

export class Top extends Component {
    static template = xml`<h1>Hello</h1>`
    setup(){
        onWillStart(async ()=>{

            // const ModelsXML = await loadFile('/static/models.xml');
            // console.log(ModelsXML)
        })

    }
    
}