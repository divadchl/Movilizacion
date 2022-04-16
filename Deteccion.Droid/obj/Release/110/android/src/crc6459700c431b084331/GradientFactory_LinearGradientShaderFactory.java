package crc6459700c431b084331;


public class GradientFactory_LinearGradientShaderFactory
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
		mono.android.Runtime.register ("UXDivers.Grial.GradientFactory+LinearGradientShaderFactory, UXDivers.Grial.Droid", GradientFactory_LinearGradientShaderFactory.class, __md_methods);
	}


	public GradientFactory_LinearGradientShaderFactory ()
	{
		super ();
		if (getClass () == GradientFactory_LinearGradientShaderFactory.class)
			mono.android.TypeManager.Activate ("UXDivers.Grial.GradientFactory+LinearGradientShaderFactory, UXDivers.Grial.Droid", "", this, new java.lang.Object[] {  });
	}

	public GradientFactory_LinearGradientShaderFactory (double p0, int[] p1, float[] p2, double p3)
	{
		super ();
		if (getClass () == GradientFactory_LinearGradientShaderFactory.class)
			mono.android.TypeManager.Activate ("UXDivers.Grial.GradientFactory+LinearGradientShaderFactory, UXDivers.Grial.Droid", "System.Double, mscorlib:System.Int32[], mscorlib:System.Single[], mscorlib:System.Double, mscorlib", this, new java.lang.Object[] { p0, p1, p2, p3 });
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
