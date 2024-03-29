import React from "react";

import Forecast from "../Components/Weather/Forecast";
import TemperatureGraph from "../Components/Weather/TemperatureGraph";

import moment from "moment";

import { Col, Row} from "react-bootstrap";
import Weather from "../Components/Weather/Weather";

const config = require('../config/config')
const phrases = require('../local/en-US.json');

config.language ? moment.locale(config.language) : moment.locale('en');

export default class ForecastScreen extends React.Component {
    constructor(props) {
        super(props);
        let s = new WebSocket('ws://' + config.wsServerBaseURL);
        s.onmessage = this.handleMessage.bind(this);
        s.addEventListener('error', m => console.log(m));
        s.addEventListener('open', m => {
            console.log(m);
            s.send({ event: 'connect', data: 'Hey there' });
        });
        this.state = {
            visibility: {
                forecast: true,
                weather: true,
                temperatureGraph: true,
            },
        };
    }

    handleMessage(message) {
        message = JSON.parse(message.data);
        console.log(message);
        const data = message.data;
        switch (message.event) {
            case 'temperature':
                this.setState({
                    temperature: data.temperature,
                });
                break;
            case 'recording':
                this.setState({
                    isRecording: message.data.isRecording,
                });
                break;
            case 'motion':
                if (!this.state.message.visible) {
                    this.setState({
                        message: {
                            text: data.message,
                            visible: true,
                        },
                    });
                    setTimeout(() => {
                        this.setState({
                            message: {
                                visible: false,
                            },
                        });
                    }, 10000);
                }
                break;
            case 'visibility':
                const prevStateVisibility = this.state.visibility;
                prevStateVisibility[data.component] = data.visible;
                this.setState({
                    visibility: prevStateVisibility,
                });
                break;
            case 'command':
                this.refs[data.component].onEvent(data);
                break;
            default:
                console.log('Unhandled event: ' + message.event);
                break;
        }
    }

    render() {
        let weather,
            forecast,
            temperatureGraph;
        if (config.modules.weather === true) {
            weather = <Weather visible={this.state.visibility.weather} phrases={phrases} />;
        }
        if (config.modules.forecast === true) {
            forecast = <Forecast visible={this.state.visibility.forecasts} />;
        }
        if (config.modules.temperatureGraph === true) {
            temperatureGraph =
                <TemperatureGraph ref="temperatureGraph" visible={this.state.visibility.temperatureGraph}/>;
        }

        const AppStyles = {
            fontSize: config.styles.textScale,
            fontFamily: config.styles.fontFamily,
            fontWeight: config.styles.fontWeight,
            paddingTop: config.styles.paddingTop,
            paddingLeft: config.styles.paddingLeft,
            paddingRight: config.styles.paddingRight,
            paddingBottom: config.styles.paddingBottom,
        };

        return (
            <div style={AppStyles} className="ForecastScreen">
                {temperatureGraph}
                <Row className="Container">
                    <Col xs={4}>
                        <Row>{weather}</Row>
                        <Row style={{marginTop: 50}}>{forecast}</Row>
                    </Col>
                </Row>
            </div>
        );
    }
}