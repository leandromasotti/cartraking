import React, { Component } from 'react';
import './Home.css';
import logo from './../assets/img/logo2.jpeg'

export class CarDetail extends Component {
    static displayName = CarDetail.name;

    constructor(props) {
        console.log(props);
        super(props);
        this.state = { car: [], loading: true, id: props.match.params.id };
    }

    componentDidMount() {
        this.populateCarData();
    }

    static renderCardDetail(car, licensePlateNumber) {
        return (
            car.licensePlateNumber == null ?
                <div>
                    <h3>No se encontraron resultados para la patente: {licensePlateNumber} </h3>
                </div>
            :
                <div>
                    <h3>Patente: {car.licensePlateNumber} - Vehiculo: {car.brand} </h3>
                
                    <p>Historial de servicios:</p>
                    
                    <table className="d-none-mobile table">
                        <thead>
                            <tr className="no-hover">
                                <th>Fecha</th>
                                <th>Kilometros actuales</th>                                
                                <th>Filtro de Aceite</th>
                                <th>Filtro de Aire</th>
                                <th>Filtro de Combustible</th>
                                <th>Filtro de Habitaculo</th>
                                <th>Aceite</th>
                            </tr>
                        </thead>
                        <tbody className="payment_table-tbody">
                            {
                                car.services.map(serv =>
                                    <tr className="no-hover">
                                        <td className="payment_product-name">{serv.date}</td>
                                        <td className="input-number payment_input-number">
                                            {serv.kilometers}
                                        </td>
                                        <td className="totalAmount"><input name="oilFilter" type="checkbox" checked={serv.oilFilter} /></td>
                                        <td className="totalAmount"><input name="airFilter" type="checkbox" checked={serv.airFilter} /></td>
                                        <td className="totalAmount"><input name="fuelFilter" type="checkbox" checked={serv.fuelFilter} /></td>
                                        <td className="totalAmount"><input name="cabinFilter" type="checkbox" checked={serv.cabinFilter} /></td>
                                        <td className="price payment_price">{serv.oilComments}</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
                
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>cargando...</em></p>
            : CarDetail.renderCardDetail(this.state.car, this.state.id);

        return (
            <div>
                <img src={logo} alt={"logo"} width="100%" height="100%" /> 
                <h1 id="tabelLabel" >Detalle de Servicios</h1>
                {contents}
                <br />
            </div>
        );
    }

    async populateCarData() {
        let url = 'car/detail?id=' + this.state.id;
        console.log(url);
        const response = await fetch(url);

        //const response = await fetch('car/detail/' + this.state.id);
        console.log(response);
        const data = await response.json();
        this.setState({ car: data, loading: false });
    }
}
