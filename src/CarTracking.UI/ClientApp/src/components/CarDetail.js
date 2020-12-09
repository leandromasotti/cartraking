import React, { Component } from 'react';
import './Home.css';

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
                    {/* 
                    <ul>
                        <li><strong>Kilometros actuales</strong> {car.lastServiceKilometers}</li>
                        <li><strong>Fecha</strong> {car.lastServiceDate}</li>
                        <li><strong>Próximo cambio sugerido</strong> {car.nextServiceKilometers}</li>
                        <li><strong>Filtro de Aceite</strong> {car.oilFilter}</li>
                        <li><strong>Filtro de Aire</strong> {car.oilComments}</li>
                        <li><strong>Filtro de Combustible</strong> {car.oilComments}</li>
                        <li><strong>Filtro de Habitaculo</strong> {car.oilComments}</li>
                        <li><strong>Aceite</strong> {car.oilComments}</li> 
                        <li> <label>
                            Filtro de Aceite:
                            <input
                                name="isGoing"
                                type="checkbox"
                                checked={car.oilFilter} />
                        </label></li>
                    </ul>
                    */}

                    <table className="d-none-mobile payment_table-detail">
                        <thead>
                            <tr className="no-hover">
                                <th>Fecha</th>
                                <th>Kilometros actuales</th>
                                <th>Aceite</th>
                                <th>Filtro de Aceite</th>
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
                                        <td className="price payment_price">{serv.oilComments}</td>
                                        <td className="totalAmount">{serv.oilFilter}</td>
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
            ? <p><em>Loading...</em></p>
            : CarDetail.renderCardDetail(this.state.car, this.state.id);

        return (
            <div>
                <h1 id="tabelLabel" >Detalle de Servicios</h1>
                {contents}
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
