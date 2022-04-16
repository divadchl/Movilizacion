package crc6459700c431b084331;


public class LongPressEffect_OnLongLickListener
	extends java.lang.Object
	implements
		mono.android.IGCUserPeer,
		android.view.View.OnLongClickListener
{
/** @hide */
	public static final String __md_methods;
	static {
		__md_methods = 
			"n_onLongClick:(Landroid/view/View;)Z:GetOnLongClick_Landroid_view_View_Handler:Android.Views.View/IOnLongClickListenerInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null\n" +
			"";
		mono.android.Runtime.register ("UXDivers.Grial.LongPressEffect+OnLongLickListener, UXDivers.Grial.Droid", LongPressEffect_OnLongLickListener.class, __md_methods);
	}


	public LongPressEffect_OnLongLickListener ()
	{
		super ();
		if (getClass () == LongPressEffect_OnLongLickListener.class)
			mono.android.TypeManager.Activate ("UXDivers.Grial.LongPressEffect+OnLongLickListener, UXDivers.Grial.Droid", "", this, new java.lang.Object[] {  });
	}


	public boolean onLongClick (android.view.View p0)
	{
		return n_onLongClick (p0);
	}

	private native boolean n_onLongClick (android.view.View p0);

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
