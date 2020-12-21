import React, { Component } from 'react';
import logofacebook from './../assets/img/Facebook-Logo.jpg'
import logoinstagram from './../assets/img/instagram-logo.png'
import logowhatsapp from './../assets/img/whatsapp-logo.png'
import './Footer.css';

export class Footer extends Component {
    //static displayName = NavMenu.name;

    constructor(props) {
        super(props);
    }
    

    render() {
        return (
            <footer>
                <div id="layoutFooter">
                    <p>
                        <a href="https://www.facebook.com/Dolores-Lubricantes-2288399798114557/" target="_blank"><img src={logofacebook} alt={"logofacebook"} width="30px" height="30px" /></a>&nbsp;&nbsp;|&nbsp;&nbsp;
                        <a href="https://www.instagram.com/doloreslubricantes/" target="_blank"><img src={logoinstagram} alt={"logoinstagram"} width="30px" height="30px" /></a>&nbsp;&nbsp;|&nbsp;&nbsp;
                        <a href="https://api.whatsapp.com/send?phone=542245509775" target="_blank"><img src={logowhatsapp} alt={"logowhatsapp"} width="30px" height="30px" /></a>
                        <br />
                        
                    </p>
                    <p>
                        © 2021 Dolores Lubricantes Todos los derechos reservados.
                    </p>
                </div>
            </footer>
            );
    }
}
