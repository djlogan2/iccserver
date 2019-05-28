import React from 'react';
import {render} from 'react-dom';

import {renderRoutes} from '../imports/startup/client/routes.jsx'

class App extends React.Component {
    render() {
        return (
            <div className="container">
                <renderRoutes/>
            </div>
        )
    }
}
