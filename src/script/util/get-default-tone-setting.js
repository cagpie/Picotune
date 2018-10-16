export default function getDefaultToneSetting () {
	const tone = [];
	for (let i=0; i<16; i++) {
		tone[i] = [0, 0, 1];
	}
	return tone;
}