require("../../../../base/client/page/components/listview/index.jsx");
require('./index.css');
var Test = require('./test.jsx');
var Test2 = require('./test2.jsx');

var Page = React.createClass({

	render: function(){
		return (
			<div>
				<Test />
				<Test2 />
			</div>
		);
	}
});