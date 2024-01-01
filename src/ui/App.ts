import { Component, xml } from "@odoo/owl";
import './App.scss'
import { Playground } from './playground'
import { Top } from "./top";

export class App extends Component {
    static components = {Top, Playground}
    
}
App.template = xml`
    <!-- <Top />    -->
    <Playground />    
    `