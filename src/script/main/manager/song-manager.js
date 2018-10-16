import parameterManager from './parameter-manager';

const data = {
	_parsedSMF: null,
	favorites: [],
	duration: null,
	tempCanvases: [],
	drawingRatio: 20,
	set parsedSMF (smf) {
		this._parsedSMF = smf;
		let ratio =  parameterManager.get('canvasRatio') * smf.header.resolution / 480;
		ratio = (this.parsedSMF.header.resolution === 960) ? (ratio / 2) : ratio;
		this.drawingRatio = ratio
	},
	get parsedSMF () {
		return this._parsedSMF;
	}
}

const songManager = {
	get: (target)=> {
		return data[target];
	},
	set: (target, value)=> {
		return data[target] = value;
	}
}

export default songManager;