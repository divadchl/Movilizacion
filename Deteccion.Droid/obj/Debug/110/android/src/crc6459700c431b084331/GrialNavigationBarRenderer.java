package crc6459700c431b084331;


public class GrialNavigationBarRenderer
	extends crc643f46942d9dd1fff9.VisualElementRenderer_1
	implements
		mono.android.IGCUserPeer
{
/** @hide */
	public static final String __md_methods;
	static {
		__md_methods = 
			"";
		mono.android.Runtime.register ("UXDivers.Grial.GrialNavigationBarRenderer, UXDivers.Grial.Droid", GrialNavigationBarRenderer.class, __md_methods);
	}


	public GrialNavigationBarRenderer (android.content.Context p0, android.util.AttributeSet p1, int p2)
	{
		super (p0, p1, p2);
		if (getClass () == GrialNavigationBarRenderer.class)
			mono.android.TypeManager.Activate ("UXDivers.Grial.GrialNavigationBarRenderer, UXDivers.Grial.Droid", "Android.Content.Context, Mono.Android:Android.Util.IAttributeSet, Mono.Android:System.Int32, mscorlib", this, new java.lang.Object[] { p0, p1, p2 });
	}


	public GrialNavigationBarRenderer (android.content.Context p0, android.util.AttributeSet p1)
	{
		super (p0, p1);
		if (getClass () == GrialNavigationBarRenderer.class)
			mono.android.TypeManager.Activate ("UXDivers.Grial.GrialNavigationBarRenderer, UXDivers.Grial.Droid", "Android.Content.Context, Mono.Android:Android.Util.IAttributeSet, Mono.Android", this, new java.lang.Object[] { p0, p1 });
	}


	public GrialNavigationBarRenderer (android.content.Context p0)
	{
		super (p0);
		if (getClass () == GrialNavigationBarRenderer.class)
			mono.android.TypeManager.Activate ("UXDivers.Grial.GrialNavigationBarRenderer, UXDivers.Grial.Droid", "Android.Content.Context, Mono.Android", this, new java.lang.Object[] { p0 });
	}

	private java.util.ArrayList refList;
	public void monodroidAddReference (java.lang.Object obj)
	{
		if (refList == null)
			refList = new java.util.ArrayList ();
		refList.add (obj);
	}

	public void monodroidClearReferences ()
	{
		if (refList != null)
			refList.clear ();
	}
}
