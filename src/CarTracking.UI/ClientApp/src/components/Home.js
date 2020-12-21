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
              <br />
              <h3>Nuestra ubicaci&oacute;n</h3>
              <iframe src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d6429.561759238092!2d-57.687384576882486!3d-36.31762017546096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x95999e5c24926e15%3A0xaa5b419c41900d94!2sMoreno%20321%2C%20B7100%20Dolores%2C%20Provincia%20de%20Buenos%20Aires!3m2!1d-36.317628899999995!2d-57.6830072!5e0!3m2!1ses!2sar!4v1608559868499!5m2!1ses!2sar" width="100%" height="300" frameborder="0" allowfullscreen="" aria-hidden="false" tabindex="0"></iframe><br />
         </div>        
    );
  }
}
