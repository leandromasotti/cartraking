import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import logo from './../assets/img/logo.png'

export class Footer extends Component {
    //static displayName = NavMenu.name;

    constructor(props) {
        super(props);
    }
    

    render() {
        return (
            <footer>
                <br />
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-top box-shadow mb-3 " light>
                    <Container>
                        {/*<img src={logo} alt={"logo"} width="30" height="30" />
                        {/*<Collapse className="d-sm-inline-flex flex-sm-row-reverse" navbar>
                            <ul className="navbar-nav flex-grow">*/}
                                <div className="text-center">
                                    <span>
                                        © Dolores Lubricantes 2021 
                                    </span>
                                </div>
                        {/*
                            </ul>
                        </Collapse>*/}
                    </Container>
                </Navbar>
            </footer>            
        );
    }
}
