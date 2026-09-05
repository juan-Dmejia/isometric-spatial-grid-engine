const C3 = self.C3;
self.C3_GetObjectRefTable = function () {
	return [
		C3.Plugins.Sprite,
		C3.Behaviors.scrollto,
		C3.Behaviors.bound,
		C3.Plugins.Keyboard,
		C3.Plugins.Mouse,
		C3.Plugins.TiledBg,
		C3.Plugins.Text
	];
};
self.C3_JsPropNameTable = [
	{ScrollTo: 0},
	{BoundToLayout: 0},
	{Camera: 0},
	{Keyboard: 0},
	{Mouse: 0},
	{LandTile: 0},
	{WaterGrid: 0},
	{WaterTile: 0},
	{Obstacle: 0},
	{Text_fps: 0},
	{Selector: 0},
	{Text_tileCount: 0},
	{Text_mouseCoords: 0},
	{Text_Controls: 0},
	{Text_pathStart: 0},
	{Text_pathEnd: 0},
	{Text_pathCost: 0},
	{Text_pathLength: 0},
	{TabMenuBackdrop: 0},
	{PathMarkerShort: 0},
	{PathMarkerLight: 0},
	{TabMenuText: 0}
];

self.InstanceType = {
	Camera: class extends self.ISpriteInstance {},
	Keyboard: class extends self.IInstance {},
	Mouse: class extends self.IInstance {},
	LandTile: class extends self.ISpriteInstance {},
	WaterGrid: class extends self.ITiledBackgroundInstance {},
	WaterTile: class extends self.ISpriteInstance {},
	Obstacle: class extends self.ISpriteInstance {},
	Text_fps: class extends self.ITextInstance {},
	Selector: class extends self.ISpriteInstance {},
	Text_tileCount: class extends self.ITextInstance {},
	Text_mouseCoords: class extends self.ITextInstance {},
	Text_Controls: class extends self.ITextInstance {},
	Text_pathStart: class extends self.ITextInstance {},
	Text_pathEnd: class extends self.ITextInstance {},
	Text_pathCost: class extends self.ITextInstance {},
	Text_pathLength: class extends self.ITextInstance {},
	TabMenuBackdrop: class extends self.ISpriteInstance {},
	PathMarkerShort: class extends self.ISpriteInstance {},
	PathMarkerLight: class extends self.ISpriteInstance {},
	TabMenuText: class extends self.ITextInstance {}
}