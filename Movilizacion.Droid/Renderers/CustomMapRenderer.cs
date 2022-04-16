using Android.Content;
using Android.Gms.Maps;
using Android.Gms.Maps.Model;
using Android.Widget;
using Elecciones.Common.Enums;
using Movilizacion.Droid.Renderers;
using Movilizacion.Renders;
using System;
using System.Collections.Generic;
using Xamarin.Forms;
using Xamarin.Forms.Maps;
using Xamarin.Forms.Maps.Android;

[assembly: ExportRenderer(typeof(CustomMap), typeof(CustomMapRenderer))]
namespace Movilizacion.Droid.Renderers
{
    public class CustomMapRenderer : MapRenderer, GoogleMap.IInfoWindowAdapter
    {
        List<CustomPin> customPins;

        public CustomMapRenderer(Context context) : base(context)
        {
        }

        protected override void OnElementChanged(Xamarin.Forms.Platform.Android.ElementChangedEventArgs<Map> e)
        {
            base.OnElementChanged(e);

            if (e.OldElement != null)
            {
                NativeMap.InfoWindowClick -= OnInfoWindowClick;
            }

            if (e.NewElement != null)
            {
                var formsMap = (CustomMap)e.NewElement;
                customPins = formsMap.CustomPins;
            }
        }

        protected override void OnMapReady(GoogleMap map)
        {
            base.OnMapReady(map);

            NativeMap.InfoWindowClick += OnInfoWindowClick;
            NativeMap.SetInfoWindowAdapter(this);
        }

        protected override MarkerOptions CreateMarker(Pin pin)
        {
            var marker = new MarkerOptions();
            marker.SetPosition(new LatLng(pin.Position.Latitude, pin.Position.Longitude));
            marker.SetTitle(pin.Label);
            marker.SetSnippet(pin.Address);
            int icon = (int)pin.GetType().GetProperty("Icon").GetValue(pin, null);
            int typeIcon = (int)pin.GetType().GetProperty("TypeIcon").GetValue(pin, null);
            
            if (icon == (int)StatusStall.Default && typeIcon == (int)TypeIcon.Stall)
                marker.SetIcon(BitmapDescriptorFactory.FromResource(Resource.Drawable.pinhome));
            else if (icon == (int)StatusStall.Open && typeIcon == (int)TypeIcon.Stall)
                marker.SetIcon(BitmapDescriptorFactory.FromResource(Resource.Drawable.pinhomegreen));
            else if (icon == (int)StatusStall.Close && typeIcon == (int)TypeIcon.Stall)
                marker.SetIcon(BitmapDescriptorFactory.FromResource(Resource.Drawable.pinhomeblue));
            else if (icon == (int)StatusStall.Incidence && typeIcon == (int)TypeIcon.Stall)
                marker.SetIcon(BitmapDescriptorFactory.FromResource(Resource.Drawable.pinhomered));
            else if(icon == 0 && typeIcon == (int)TypeIcon.Person)
                marker.SetIcon(BitmapDescriptorFactory.FromResource(Resource.Drawable.pinperson));
            else if (icon <= 6 && typeIcon == (int)TypeIcon.Person)
                marker.SetIcon(BitmapDescriptorFactory.FromResource(Resource.Drawable.pinpersonblue));
            else if (icon == 7 && typeIcon == (int)TypeIcon.Person)
                marker.SetIcon(BitmapDescriptorFactory.FromResource(Resource.Drawable.pinpersonred));
            else if (icon == 8 && typeIcon == (int)TypeIcon.Person)
                marker.SetIcon(BitmapDescriptorFactory.FromResource(Resource.Drawable.pinpersongreen));
            
            return marker;
        }

        void OnInfoWindowClick(object sender, GoogleMap.InfoWindowClickEventArgs e)
        {
            var customPin = GetCustomPin(e.Marker);
            if (customPin == null)
            {
                throw new Exception("Custom pin not found");
            }
        }

        public Android.Views.View GetInfoContents(Marker marker)
        {
            var inflater = Android.App.Application.Context.GetSystemService(Context.LayoutInflaterService) as Android.Views.LayoutInflater;
            if (inflater != null)
            {
                Android.Views.View view;

                var customPin = GetCustomPin(marker);
                if (customPin == null)
                {
                    throw new Exception("Custom pin not found");
                }

                view = inflater.Inflate(Resource.Layout.MapInfoWindow, null);

                var infoTitle = view.FindViewById<TextView>(Resource.Id.InfoWindowTitle);
                var infoSubtitle = view.FindViewById<TextView>(Resource.Id.InfoWindowSubtitle);

                if (infoTitle != null)
                {
                    infoTitle.Text = marker.Title;
                }
                if (infoSubtitle != null)
                {
                    infoSubtitle.Text = marker.Snippet;
                }

                return view;
            }
            return null;
        }

        public Android.Views.View GetInfoWindow(Marker marker)
        {
            return null;
        }

        CustomPin GetCustomPin(Marker annotation)
        {
            var position = new Position(annotation.Position.Latitude, annotation.Position.Longitude);
            foreach (var pin in customPins)
            {
                if (pin.Position == position)
                {
                    return pin;
                }
            }
            return null;
        }
    }
}