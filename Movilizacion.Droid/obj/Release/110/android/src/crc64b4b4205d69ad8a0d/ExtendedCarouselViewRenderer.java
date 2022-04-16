package crc64b4b4205d69ad8a0d;


public class ExtendedCarouselViewRenderer
	extends crc64e0221cc1a9d53af5.CarouselViewRenderer_Fix
	implements
		mono.android.IGCUserPeer
{
/** @hide */
	public static final String __md_methods;
	static {
		__md_methods = 
			"n_onSizeChanged:(IIII)V:GetOnSizeChanged_IIIIHandler\n" +
			"";
		mono.android.Runtime.register ("Movilizacion.Droid.ExtendedCarouselViewRenderer, Movilizacion.Droid", ExtendedCarouselViewRenderer.class, __md_methods);
	}


	public ExtendedCarouselViewRenderer (android.content.Context p0, android.util.AttributeSet p1, int p2)
	{
		super (p0, p1, p2);
		if (getClass () == ExtendedCarouselViewRenderer.class)
			mono.android.TypeManager.Activate ("Movilizacion.Droid.ExtendedCarouselViewRenderer, Movilizacion.Droid", "Android.Content.Context, Mono.Android:Android.Util.IAttributeSet, Mono.Android:System.Int32, mscorlib", this, new java.lang.Object[] { p0, p1, p2 });
	}


	public ExtendedCarouselViewRenderer (android.content.Context p0, android.util.AttributeSet p1)
	{
		super (p0, p1);
		if (getClass () == ExtendedCarouselViewRenderer.class)
			mono.android.TypeManager.Activate ("Movilizacion.Droid.ExtendedCarouselViewRenderer, Movilizacion.Droid", "Android.Content.Context, Mono.Android:Android.Util.IAttributeSet, Mono.Android", this, new java.lang.Object[] { p0, p1 });
	}


	public ExtendedCarouselViewRenderer (android.content.Context p0)
	{
		super (p0);
		if (getClass () == ExtendedCarouselViewRenderer.class)
			mono.android.TypeManager.Activate ("Movilizacion.Droid.ExtendedCarouselViewRenderer, Movilizacion.Droid", "Android.Content.Context, Mono.Android", this, new java.lang.Object[] { p0 });
	}


	public void onSizeChanged (int p0, int p1, int p2, int p3)
	{
		n_onSizeChanged (p0, p1, p2, p3);
	}

	private native void n_onSizeChanged (int p0, int p1, int p2, int p3);

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
