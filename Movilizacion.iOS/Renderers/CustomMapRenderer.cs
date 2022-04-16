using CoreGraphics;
using Elecciones.Common.Enums;
using MapKit;
using Movilizacion.iOS.Renderers;
using Movilizacion.Renders;
using System.Collections.Generic;
using System.Linq;
using UIKit;
using Xamarin.Forms;
using Xamarin.Forms.Maps;
using Xamarin.Forms.Maps.iOS;
using Xamarin.Forms.Platform.iOS;

[assembly: ExportRenderer(typeof(CustomMap), typeof(CustomMapRenderer))]
namespace Movilizacion.iOS.Renderers
{
    public class CustomMapRenderer : MapRenderer
    {
        private UIView customPinView;
        private List<CustomPin> pins;
        private int _icon;
        private int _typeIcon;

        protected override void OnElementChanged(ElementChangedEventArgs<View> e)
        {
            base.OnElementChanged(e);
            if (e.OldElement != null)
            {
                // Unsubscribe from events
                if (Control is MKMapView nativeMap)
                {
                    nativeMap.RemoveAnnotations(nativeMap.Annotations);
                    nativeMap.GetViewForAnnotation = null;
                    nativeMap.CalloutAccessoryControlTapped -= OnCalloutAccessoryControlTapped;
                    nativeMap.DidSelectAnnotationView -= OnDidSelectAnnotationView;
                    nativeMap.DidDeselectAnnotationView -= OnDidDeselectAnnotationView;
                }
            }

            if (e.NewElement != null)
            {
                // Subscribe to events and configure the native control to be used
                var formsMap = (CustomMap)e.NewElement;
                var nativeMap = Control as MKMapView;
                pins = formsMap.CustomPins;

                nativeMap.GetViewForAnnotation = GetViewForAnnotation;
                nativeMap.CalloutAccessoryControlTapped += OnCalloutAccessoryControlTapped;
                nativeMap.DidSelectAnnotationView += OnDidSelectAnnotationView;
                nativeMap.DidDeselectAnnotationView += OnDidDeselectAnnotationView;
            }


        }

        protected override MKAnnotationView GetViewForAnnotation(MKMapView mapView, IMKAnnotation annotation)
        {
            MKAnnotationView annotationView = null;

            if (IsUserLocation(mapView, annotation))
                return null;

            var customPin = GetCustomPin(annotation);
            if (customPin == null)
            {
                return null;
                //throw new Exception("Custom pin not found");
            }

            annotationView = mapView.DequeueReusableAnnotation(customPin.Id.ToString());
            if (annotationView == null)
            {
                annotationView = new CustomMKAnnotationView(annotation, customPin.Id.ToString());

                if (_icon == (int)StatusStall.Default && _typeIcon == (int)TypeIcon.Stall)
                    annotationView.Image = UIImage.FromFile("pinhome.png");
                else if (_icon == (int)StatusStall.Open && _typeIcon == (int)TypeIcon.Stall)
                    annotationView.Image = UIImage.FromFile("pinhomegreen.png");
                else if (_icon == (int)StatusStall.Close && _typeIcon == (int)TypeIcon.Stall)
                    annotationView.Image = UIImage.FromFile("pinhomeblue.png");
                else if (_icon == (int)StatusStall.Incidence && _typeIcon == (int)TypeIcon.Stall)
                    annotationView.Image = UIImage.FromFile("pinhomered.png");
                else if (_icon == 0 && _typeIcon == (int)TypeIcon.Person)
                    annotationView.Image = UIImage.FromFile("pinperson.png");
                else if (_icon <= 6 && _typeIcon == (int)TypeIcon.Person)
                    annotationView.Image = UIImage.FromFile("pinpersonblue.png");
                else if (_icon == 7 && _typeIcon == (int)TypeIcon.Person)
                    annotationView.Image = UIImage.FromFile("pinpersonred.png");
                else if (_icon == 8 && _typeIcon == (int)TypeIcon.Person)
                    annotationView.Image = UIImage.FromFile("pinpersongreen.png");

                annotationView.CalloutOffset = new CGPoint(0, 0);
                ((CustomMKAnnotationView)annotationView).Id = customPin.Id.ToString();
            }
            annotationView.CanShowCallout = true;
            return annotationView;
        }

        void OnCalloutAccessoryControlTapped(object sender, MKMapViewAccessoryTappedEventArgs e)
        {
            var customView = e.View as CustomMKAnnotationView;
        }

        void OnDidSelectAnnotationView(object sender, MKAnnotationViewEventArgs e)
        {
            var customView = e.View as CustomMKAnnotationView;
            customPinView = new UIView();
            // TODO Do something if you want to add extra information on the annotation view. Example: a logo or URL image
        }

        private void OnDidDeselectAnnotationView(object sender, MKAnnotationViewEventArgs e)
        {
            if (e.View.Selected) return;
            customPinView.RemoveFromSuperview();
            customPinView.Dispose();
            customPinView = null;
        }

        // TODO make this index-like search
        private Pin GetCustomPin(IMKAnnotation annotation)
        {
            var position = new Position(annotation.Coordinate.Latitude, annotation.Coordinate.Longitude);
            foreach (var pin in pins)
            {
                if (pin.Position == position)
                {
                    _icon = pin.Icon;
                    _typeIcon = pin.TypeIcon;
                    return pin;
                }
            }
            return null;
        }

        private bool IsUserLocation(MKMapView mapView, IMKAnnotation annotation)
        {
            var userLocationAnnotation = ObjCRuntime.Runtime.GetNSObject(annotation.Handle) as MKUserLocation;
            if (userLocationAnnotation != null)
            {
                return userLocationAnnotation == mapView.UserLocation;
            }

            return false;
        }
    }

    public class CustomMKAnnotationView : MKAnnotationView
    {
        public string Id { get; set; }

        public CustomMKAnnotationView(IMKAnnotation annotation, string id) : base(annotation, id)
        {

        }
    }
}