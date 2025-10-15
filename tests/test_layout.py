import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class IdCollector(HTMLParser):
  def __init__(self):
    super().__init__()
    self.ids = set()
    self.roles = set()
    self.aria_labels = []

  def handle_starttag(self, tag, attrs):
    attributes = dict(attrs)
    element_id = attributes.get("id")
    if (element_id := attributes.get("id")):
      self.ids.add(element_id)
    if (role := attributes.get("role")):
      self.roles.add(role)
    if (aria := attributes.get("aria-label")):
      self.aria_labels.append(aria)


class TradingSpaceLayoutTest(unittest.TestCase):
  def setUp(self):
    self.html_path = ROOT / "web" / "index.html"
    self.css_path = ROOT / "web" / "assets" / "styles.css"
    self.js_path = ROOT / "web" / "app.js"

  def test_core_sections_are_present(self):
    parser = IdCollector()
    parser.feed(self.html_path.read_text(encoding="utf-8"))
    expected_ids = {"price-chart", "orderbook-bids", "orderbook-asks", "trade-tape", "metrics", "alerts-list"}
    self.assertTrue(expected_ids.issubset(parser.ids))
    self.assertIn("toolbar", parser.roles)
    self.assertIn("list", parser.roles)

  def test_styles_define_brand_system(self):
    css_content = self.css_path.read_text(encoding="utf-8")
    for token in ["--color-bg", "--color-accent", "--color-text", "--gradient-surface"]:
      self.assertIn(token, css_content)
    self.assertRegex(css_content, r"@media \(max-width: 1200px\)")

  def test_template_switcher_is_configured(self):
    html_content = self.html_path.read_text(encoding="utf-8")
    self.assertIn('id="template-select"', html_content)
    self.assertIn('data-template="balanced"', html_content)

    css_content = self.css_path.read_text(encoding="utf-8")
    self.assertIn('[data-template="heatmap"]', css_content)
    self.assertIn('[data-template="orderflow"]', css_content)

    js_content = self.js_path.read_text(encoding="utf-8")
    self.assertIn("TEMPLATE_CONFIGS", js_content)
    self.assertIn("setupTemplateSwitcher", js_content)

  def test_application_script_initialises_dashboard(self):
    js_content = self.js_path.read_text(encoding="utf-8")
    self.assertIn("function initialiseDashboard", js_content)
    self.assertIn("document.addEventListener(\"DOMContentLoaded\"", js_content)
    self.assertRegex(js_content, r"renderChart\(document.getElementById\(\"price-chart\"\)")

  def test_mock_data_is_loaded(self):
    data_content = (ROOT / "web" / "data" / "mock-data.js").read_text(encoding="utf-8")
    series_match = re.search(r"mockPriceSeries\s*=\s*\[(.*?)\]\s*;", data_content, re.S)
    self.assertIsNotNone(series_match, "mockPriceSeries introuvable")
    bars = re.findall(r'time:\s*"\d{2}:\d{2}"', series_match.group(1))
    self.assertGreaterEqual(len(bars), 12)


if __name__ == "__main__":
  unittest.main()
