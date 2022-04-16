package crc6459700c431b084331;


public class GradientFactory_RadialGradientShaderFactory
	extends android.graphics.drawable.ShapeDrawable.ShaderFactory
	implements
		mono.android.IGCUserPeer
{
/** @hide */
	public static final String __md_methods;
	static {
		__md_methods = 
			"n_resize:(II)Landroid/graphics/Shader;:GetResize_IIHandler\n" +
			"";
		mono.android.Runtime.register ("UXDivers.Grial.GradientFactory+RadialGradientShaderFactory, UXDivers.Grial.Droid", GradientFactory_RadialGradientShaderFactory.class, __md_methods);
	}


	public GradientFactory_RadialGradientShaderFactory ()
	{
		super ();
		if (getClass () == GradientFactory_RadialGradientShaderFactory.class)
			mono.android.TypeManager.Activate ("UXDivers.Grial.GradientFactory+RadialGradientShaderFactory, UXDivers.Grial.Droid", "", this, new java.lang.Object[] {  });
	}


	public android.graphics.Shader resize (int p0, int p1)
	{
		return n_resize (p0, p1);
	}

	private native android.graphics.Shader n_resize (int p0, int p1);

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
