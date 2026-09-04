const C3 = self.C3;
self.C3_GetObjectRefTable = function () {
	return [
		C3.Plugins.Sprite,
		C3.Behaviors.scrollto,
		C3.Behaviors.bound,
		C3.Plugins.Keyboard,
		C3.Plugins.Mouse,
		C3.Plugins.TiledBg,
		C3.Plugins.Text,
		C3.Behaviors.Anchor
	];
};
self.C3_JsPropNameTable = [
	{ScrollTo: 0},
	{BoundToLayout: 0},
	{Camera: 0},
	{Keyboard: 0},
	{Mouse: 0},
	{GrassTile: 0},
	{WaterGrid: 0},
	{WaterTile: 0},
	{value: 0},
	{Anchor: 0},
	{Text: 0},
	{Selector: 0}
];

self.InstanceType = {
	Camera: class extends self.ISpriteInstance {},
	Keyboard: class extends self.IInstance {},
	Mouse: class extends self.IInstance {},
	GrassTile: class extends self.ISpriteInstance {},
	WaterGrid: class extends self.ITiledBackgroundInstance {},
	WaterTile: class extends self.ISpriteInstance {},
	Text: class extends self.ITextInstance {},
	Selector: class extends self.ISpriteInstance {}
}