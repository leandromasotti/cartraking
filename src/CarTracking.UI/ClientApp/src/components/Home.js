import React, { Component } from 'react';
import logo from './../assets/img/logo2.jpeg'
//import { useHistory } from "react-router-dom";

export class Home extends Component {
    static displayName = Home.name;
    //static history = useHistory();

    constructor(props, context) {
        super(props, context);
        this.state = { value: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    handleSubmit(event) {
        //alert('A name was submitted: ' + this.state.value);
        this.props.history.push('/car-detail/' + this.state.value);
        //history.push('/card-detail/' + this.state.value);
        event.preventDefault();
    }

  render () {
      return (
          <div style={{
             // display: "flex",
              justifyContent: "center",
              alignItems: "center"
          }}>
            <img src={logo} alt={"logo"} width="100%" height="100%" /> 
            {/*<h1>Dolores Lubricantes</h1>*/}
            <h3>Servicio de cambio de aceite y filtro</h3>
            <ul>
                <li>Tel&eacute;fono: 02245 50-9775</li>
                <li>Mail: <a href='mailto:lubricentrodolores@gmail.com' target='_blank'>lubricentrodolores@gmail.com</a></li>
                <li>WhatsApp: <a href='https://api.whatsapp.com/send?phone=542245509775' target='_blank'>+54 2245 50-9775</a></li>
            </ul>
            <p>No dudes en consultarnos</p>
            <br />
            <h3>Consulta tus cambios de aceite y filtro</h3>            
            <form onSubmit={this.handleSubmit}>
                <label>
                    Por favor ingrese la patente de su vehiculo:
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Consultar" />
            </form>
         </div>        
    );
  }
}
