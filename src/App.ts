import { Component, xml } from "@odoo/owl";
import './App.scss'
import { Top } from "./ui/top";

export class App extends Component {
    static components = {Top}
    
}
App.template = xml`
    <Top />    
    `