const data = {
	canvasRatio: 20,
	canvasNoteHeight: 4,
	canvasBottomMargin: 75
}

const parameterManager = {
	get: function (target) {
		return data[target];
	},
	set: function (target, value) {
		return data[target] = value;
	}
}

export default parameterManager;
